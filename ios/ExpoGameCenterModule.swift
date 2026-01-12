import ExpoModulesCore
import GameKit
import Foundation
import UIKit

// Delegate class to handle GameCenter view controller dismissal
class GameCenterDelegate: NSObject, GKGameCenterControllerDelegate {
  var onDismiss: (() -> Void)?

  func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
    print("[ExpoGameCenter] User dismissed GameCenter view controller")
    gameCenterViewController.dismiss(animated: true) {
      print("[ExpoGameCenter] GameCenter view controller dismissed")
      self.onDismiss?()
    }
  }
}

public class ExpoGameCenterModule: Module {
  // Promise storage for async UI operations
  private var leaderboardPromise: Promise?
  private var achievementsPromise: Promise?
  private var gameCenterPromise: Promise?

  // Delegate instance
  private let gameCenterDelegate = GameCenterDelegate()

  // Required for module registration
  public required init(appContext: AppContext) {
    print("[ExpoGameCenter] *** Module initialized ***")
    super.init(appContext: appContext)
    // DON'T set up authentication handler here - it causes race conditions
    // Handler will be set up on-demand when authenticateLocalPlayer() is called
  }

  public func definition() -> ModuleDefinition {
    Name("ExpoGameCenter")

    OnCreate {
      print("[ExpoGameCenter] *** Module definition created ***")
    }

    AsyncFunction("isGameCenterAvailable") { (promise: Promise) in
      print("[ExpoGameCenter] isGameCenterAvailable called")
      // GameKit is always available on iOS
      promise.resolve(true)
    }

    AsyncFunction("authenticateLocalPlayer") { (promise: Promise) in
      print("[ExpoGameCenter] authenticateLocalPlayer called")

      // Fast path: Check if already authenticated
      if GKLocalPlayer.local.isAuthenticated {
        print("[ExpoGameCenter] ✅ Player already authenticated")
        promise.resolve(true)
        return
      }

      print("[ExpoGameCenter] Setting up authentication handler NOW (on-demand)")

      // Set up handler RIGHT NOW when method is called (not at module init!)
      // This avoids race conditions where handler fires before JS calls this method
      GKLocalPlayer.local.authenticateHandler = { [weak self] viewController, error in
        guard let self = self else {
          print("[ExpoGameCenter] ❌ Module released during authentication")
          promise.reject("MODULE_RELEASED", "Module was released during authentication")
          return
        }

        // Handle error case
        if let error = error {
          print("[ExpoGameCenter] ❌ Authentication error: \(error.localizedDescription)")
          promise.reject("AUTHENTICATION_ERROR", error.localizedDescription)
          return
        }

        // If viewController provided, user needs to sign in
        if let viewController = viewController {
          print("[ExpoGameCenter] 📱 Presenting authentication UI")

          DispatchQueue.main.async {
            guard let rootVC = self.getRootViewController() else {
              print("[ExpoGameCenter] ❌ No root view controller available")
              promise.reject("NO_ROOT_VC", "Could not find root view controller")
              return
            }

            // Present the sign-in UI
            rootVC.present(viewController, animated: true) {
              print("[ExpoGameCenter] Authentication UI presented, waiting for completion...")
              // Poll for authentication completion
              self.pollForAuthenticationCompletion(promise: promise)
            }
          }
          return
        }

        // No viewController and no error = authentication complete
        let isAuthenticated = GKLocalPlayer.local.isAuthenticated
        print("[ExpoGameCenter] ✅ Authentication completed: \(isAuthenticated)")
        promise.resolve(isAuthenticated)
      }
    }

    AsyncFunction("getConstants") { (promise: Promise) in
      promise.resolve([
        "isGameCenterAvailable": true
      ])
    }

    AsyncFunction("getLocalPlayer") { (promise: Promise) in
      guard GKLocalPlayer.local.isAuthenticated else {
        promise.resolve(nil)
        return
      }

      let playerInfo = [
        "playerID": GKLocalPlayer.local.gamePlayerID,
        "displayName": GKLocalPlayer.local.displayName,
        "alias": GKLocalPlayer.local.alias
      ]
      promise.resolve(playerInfo)
    }

    AsyncFunction("getPlayerImage") { (promise: Promise) in
      print("[ExpoGameCenter] getPlayerImage called")

      guard GKLocalPlayer.local.isAuthenticated else {
        print("[ExpoGameCenter] Player not authenticated")
        promise.resolve(nil)
        return
      }

      GKLocalPlayer.local.loadPhoto(for: .small) { image, error in
        DispatchQueue.main.async {
          if let error = error {
            print("[ExpoGameCenter] Image load error: \(error.localizedDescription)")
            promise.resolve(nil)
            return
          }

          guard let image = image,
                let imageData = image.pngData() else {
            promise.resolve(nil)
            return
          }

          let base64String = imageData.base64EncodedString()
          promise.resolve("data:image/png;base64,\(base64String)")
        }
      }
    }

    AsyncFunction("submitScore") { (score: Int, leaderboardID: String, promise: Promise) in
      print("[ExpoGameCenter] submitScore: \(score) to \(leaderboardID)")

      guard GKLocalPlayer.local.isAuthenticated else {
        promise.reject("NOT_AUTHENTICATED", "Player not authenticated")
        return
      }

      let scoreReporter = GKScore(leaderboardIdentifier: leaderboardID)
      scoreReporter.value = Int64(score)

      GKScore.report([scoreReporter]) { error in
        if let error = error {
          print("[ExpoGameCenter] ❌ Score submit error: \(error.localizedDescription)")
          promise.reject("SCORE_SUBMIT_ERROR", error.localizedDescription)
        } else {
          print("[ExpoGameCenter] ✅ Score submitted successfully")
          promise.resolve(true)
        }
      }
    }

    AsyncFunction("reportAchievement") { (achievementID: String, percentComplete: Double, promise: Promise) in
      print("[ExpoGameCenter] reportAchievement: \(achievementID) at \(percentComplete)%")

      guard GKLocalPlayer.local.isAuthenticated else {
        promise.reject("NOT_AUTHENTICATED", "Player not authenticated")
        return
      }

      let achievement = GKAchievement(identifier: achievementID)
      achievement.percentComplete = percentComplete
      achievement.showsCompletionBanner = true

      GKAchievement.report([achievement]) { error in
        if let error = error {
          print("[ExpoGameCenter] ❌ Achievement report error: \(error.localizedDescription)")
          promise.reject("ACHIEVEMENT_REPORT_ERROR", error.localizedDescription)
        } else {
          print("[ExpoGameCenter] ✅ Achievement reported successfully")
          promise.resolve(true)
        }
      }
    }

    AsyncFunction("presentLeaderboard") { (leaderboardID: String, promise: Promise) in
      print("[ExpoGameCenter] presentLeaderboard: \(leaderboardID)")

      // DON'T check GKLocalPlayer.local.isAuthenticated - it might hang!
      // GameKit will handle authentication automatically if needed

      DispatchQueue.main.async {
        guard let rootViewController = self.getRootViewController() else {
          print("[ExpoGameCenter] ❌ No root view controller")
          promise.reject("NO_ROOT_VC", "Could not find root view controller")
          return
        }

        // Store promise to resolve when user dismisses the leaderboard
        self.leaderboardPromise = promise

        // Set up delegate callback to resolve promise when dismissed
        self.gameCenterDelegate.onDismiss = { [weak self] in
          guard let self = self else { return }
          if let promise = self.leaderboardPromise {
            self.leaderboardPromise = nil
            print("[ExpoGameCenter] ✅ Resolving leaderboard promise")
            promise.resolve(nil)
          }
        }

        if #available(iOS 14.0, *) {
          let leaderboardVC = GKGameCenterViewController(
            leaderboardID: leaderboardID,
            playerScope: .global,
            timeScope: .allTime
          )
          leaderboardVC.gameCenterDelegate = self.gameCenterDelegate

          print("[ExpoGameCenter] 📊 Presenting leaderboard...")
          rootViewController.present(leaderboardVC, animated: true) {
            print("[ExpoGameCenter] Leaderboard UI visible")
            // Set timeout - if user doesn't dismiss within 5 minutes, something is wrong
            self.scheduleLeaderboardTimeout()
          }
        } else {
          // Fallback for iOS 13
          let leaderboardVC = GKGameCenterViewController()
          leaderboardVC.gameCenterDelegate = self.gameCenterDelegate
          leaderboardVC.viewState = .leaderboards
          leaderboardVC.leaderboardIdentifier = leaderboardID

          rootViewController.present(leaderboardVC, animated: true) {
            print("[ExpoGameCenter] Leaderboard UI visible (iOS 13)")
            self.scheduleLeaderboardTimeout()
          }
        }
      }
    }

    AsyncFunction("presentAchievements") { (promise: Promise) in
      print("[ExpoGameCenter] presentAchievements called")

      // DON'T check isAuthenticated - it might hang!
      // GameKit will handle authentication automatically

      DispatchQueue.main.async {
        guard let rootViewController = self.getRootViewController() else {
          promise.reject("NO_ROOT_VC", "Could not find root view controller")
          return
        }

        self.achievementsPromise = promise

        // Set up delegate callback to resolve promise when dismissed
        self.gameCenterDelegate.onDismiss = { [weak self] in
          guard let self = self else { return }
          if let promise = self.achievementsPromise {
            self.achievementsPromise = nil
            promise.resolve(nil)
          }
        }

        if #available(iOS 14.0, *) {
          let achievementVC = GKGameCenterViewController(state: .achievements)
          achievementVC.gameCenterDelegate = self.gameCenterDelegate

          rootViewController.present(achievementVC, animated: true) {
            self.scheduleAchievementsTimeout()
          }
        } else {
          let achievementVC = GKGameCenterViewController()
          achievementVC.gameCenterDelegate = self.gameCenterDelegate
          achievementVC.viewState = .achievements

          rootViewController.present(achievementVC, animated: true) {
            self.scheduleAchievementsTimeout()
          }
        }
      }
    }

    AsyncFunction("presentGameCenterViewController") { (promise: Promise) in
      print("[ExpoGameCenter] presentGameCenterViewController called")

      // DON'T check isAuthenticated - it might hang!
      // GameKit will handle authentication automatically

      DispatchQueue.main.async {
        guard let rootViewController = self.getRootViewController() else {
          promise.reject("NO_ROOT_VC", "Could not find root view controller")
          return
        }

        self.gameCenterPromise = promise

        // Set up delegate callback to resolve promise when dismissed
        self.gameCenterDelegate.onDismiss = { [weak self] in
          guard let self = self else { return }
          if let promise = self.gameCenterPromise {
            self.gameCenterPromise = nil
            promise.resolve(nil)
          }
        }

        if #available(iOS 14.0, *) {
          let gameCenterVC = GKGameCenterViewController(state: .default)
          gameCenterVC.gameCenterDelegate = self.gameCenterDelegate

          rootViewController.present(gameCenterVC, animated: true) {
            self.scheduleGameCenterTimeout()
          }
        } else {
          let gameCenterVC = GKGameCenterViewController()
          gameCenterVC.gameCenterDelegate = self.gameCenterDelegate
          gameCenterVC.viewState = .default

          rootViewController.present(gameCenterVC, animated: true) {
            self.scheduleGameCenterTimeout()
          }
        }
      }
    }
  }

  // MARK: - Private Methods

  /// Poll for authentication completion after UI is presented
  private func pollForAuthenticationCompletion(promise: Promise) {
    var attempts = 0
    let maxAttempts = 60 // 30 seconds (0.5s interval)

    let timer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { timer in
      attempts += 1

      let isAuthenticated = GKLocalPlayer.local.isAuthenticated

      if isAuthenticated {
        // User successfully authenticated
        print("[ExpoGameCenter] ✅ User authenticated successfully")
        timer.invalidate()
        promise.resolve(true)
      } else if attempts >= maxAttempts {
        // Timeout - user probably cancelled or closed the dialog
        print("[ExpoGameCenter] ⏱️ Authentication timeout (user likely cancelled)")
        timer.invalidate()
        promise.resolve(false)
      }
    }
  }

  /// Schedule timeout for leaderboard presentation
  private func scheduleLeaderboardTimeout() {
    DispatchQueue.main.asyncAfter(deadline: .now() + 300.0) { // 5 minutes
      if let promise = self.leaderboardPromise {
        self.leaderboardPromise = nil
        print("[ExpoGameCenter] ⏱️ Leaderboard timeout (should not happen)")
        promise.resolve(nil)
      }
    }
  }

  /// Schedule timeout for achievements presentation
  private func scheduleAchievementsTimeout() {
    DispatchQueue.main.asyncAfter(deadline: .now() + 300.0) {
      if let promise = self.achievementsPromise {
        self.achievementsPromise = nil
        promise.resolve(nil)
      }
    }
  }

  /// Schedule timeout for game center presentation
  private func scheduleGameCenterTimeout() {
    DispatchQueue.main.asyncAfter(deadline: .now() + 300.0) {
      if let promise = self.gameCenterPromise {
        self.gameCenterPromise = nil
        promise.resolve(nil)
      }
    }
  }

  /// Get the root view controller for presenting modals
  private func getRootViewController() -> UIViewController? {
    // iOS 15+ preferred method
    if #available(iOS 15.0, *) {
      if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
         let window = windowScene.windows.first(where: { $0.isKeyWindow }) {
        return window.rootViewController
      }
    }

    // Fallback for older iOS versions
    if let window = UIApplication.shared.windows.first(where: { $0.isKeyWindow }) {
      return window.rootViewController
    }

    // Last resort fallback
    return UIApplication.shared.windows.first?.rootViewController
  }
}
