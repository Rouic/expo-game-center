import ExpoModulesCore
import GameKit
import Foundation
import UIKit

// Delegate class to handle GameCenter view controller events
class GameCenterDelegate: NSObject, GKGameCenterControllerDelegate {
  func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
    gameCenterViewController.dismiss(animated: true, completion: nil)
  }
}

public class ExpoGameCenterModule: Module {
  private let gameCenterDelegate = GameCenterDelegate()
  private var authenticationPromise: Promise?
  private var hasSetupAuthHandler = false
  
  // Required for module registration
  public required init(appContext: AppContext) {
    print("[ExpoGameCenter] *** Module class being initialized ***")
    super.init(appContext: appContext)
    print("[ExpoGameCenter] *** Module initialized successfully ***")
    
    // Set up authentication handler once during module initialization
    setupAuthenticationHandler()
  }
  
  public func definition() -> ModuleDefinition {
    Name("ExpoGameCenter")
    
    OnCreate {
      print("[ExpoGameCenter] *** Module definition created ***")
      print("[ExpoGameCenter] *** GameKit available: true")
    }

    AsyncFunction("isGameCenterAvailable") { (promise: Promise) in
      print("[ExpoGameCenter] isGameCenterAvailable called")
      // GameKit is always available on iOS, but GameCenter might be disabled
      let isAvailable = true
      print("[ExpoGameCenter] GameCenter availability: \(isAvailable)")
      promise.resolve(isAvailable)
    }

    AsyncFunction("authenticateLocalPlayer") { (promise: Promise) in
      print("[ExpoGameCenter] authenticateLocalPlayer called")
      
      // If already authenticated, resolve immediately
      if GKLocalPlayer.local.isAuthenticated {
        print("[ExpoGameCenter] Already authenticated, returning true")
        promise.resolve(true)
        return
      }
      
      // Store the promise to resolve later
      self.authenticationPromise = promise
      
      // Trigger authentication by accessing a GameCenter feature
      // This will cause the auth handler to be called if not authenticated
      _ = GKLocalPlayer.local.isAuthenticated
      
      // Set a timeout for authentication
      DispatchQueue.main.asyncAfter(deadline: .now() + 10.0) {
        if let pendingPromise = self.authenticationPromise {
          self.authenticationPromise = nil
          pendingPromise.reject("AUTHENTICATION_TIMEOUT", "Authentication timed out")
        }
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
        print("[ExpoGameCenter] Player not authenticated for image")
        promise.resolve(nil)
        return
      }
      
      print("[ExpoGameCenter] Loading player photo")
      GKLocalPlayer.local.loadPhoto(for: .small) { image, error in
        DispatchQueue.main.async {
          if let error = error {
            print("[ExpoGameCenter] Image load error: \(error.localizedDescription)")
            promise.resolve(nil)
            return
          }
          
          guard let image = image else {
            print("[ExpoGameCenter] No image returned")
            promise.resolve(nil)
            return
          }
          
          guard let imageData = image.pngData() else {
            print("[ExpoGameCenter] Failed to convert image to PNG data")
            promise.resolve(nil)
            return
          }
          
          let base64String = imageData.base64EncodedString()
          print("[ExpoGameCenter] Image converted to base64")
          promise.resolve("data:image/png;base64,\(base64String)")
        }
      }
    }

    AsyncFunction("submitScore") { (score: Int, leaderboardID: String, promise: Promise) in
      print("[ExpoGameCenter] submitScore called with score: \(score), leaderboard: \(leaderboardID)")
      
      guard GKLocalPlayer.local.isAuthenticated else {
        promise.reject("NOT_AUTHENTICATED", "Player not authenticated")
        return
      }
      
      let scoreReporter = GKScore(leaderboardIdentifier: leaderboardID)
      scoreReporter.value = Int64(score)
      
      GKScore.report([scoreReporter]) { error in
        if let error = error {
          promise.reject("SCORE_SUBMIT_ERROR", error.localizedDescription)
        } else {
          promise.resolve(true)
        }
      }
    }

    AsyncFunction("reportAchievement") { (achievementID: String, percentComplete: Double, promise: Promise) in
      print("[ExpoGameCenter] reportAchievement called: \(achievementID) at \(percentComplete)%")
      
      guard GKLocalPlayer.local.isAuthenticated else {
        promise.reject("NOT_AUTHENTICATED", "Player not authenticated")
        return
      }
      
      let achievement = GKAchievement(identifier: achievementID)
      achievement.percentComplete = percentComplete
      achievement.showsCompletionBanner = true
      
      GKAchievement.report([achievement]) { error in
        if let error = error {
          promise.reject("ACHIEVEMENT_REPORT_ERROR", error.localizedDescription)
        } else {
          promise.resolve(true)
        }
      }
    }

    AsyncFunction("presentLeaderboard") { (leaderboardID: String, promise: Promise) in
      print("[ExpoGameCenter] presentLeaderboard called with ID: \(leaderboardID)")
      
      DispatchQueue.main.async {
        guard let rootViewController = self.getRootViewController() else {
          promise.reject("PRESENTATION_ERROR", "Could not find root view controller")
          return
        }
        
        if #available(iOS 14.0, *) {
          let leaderboardViewController = GKGameCenterViewController(leaderboardID: leaderboardID, playerScope: .global, timeScope: .allTime)
          leaderboardViewController.gameCenterDelegate = self.gameCenterDelegate
          
          rootViewController.present(leaderboardViewController, animated: true) {
            promise.resolve(nil)
          }
        } else {
          // Fallback for iOS 13
          let leaderboardViewController = GKGameCenterViewController()
          leaderboardViewController.gameCenterDelegate = self.gameCenterDelegate
          leaderboardViewController.viewState = .leaderboards
          leaderboardViewController.leaderboardIdentifier = leaderboardID
          
          rootViewController.present(leaderboardViewController, animated: true) {
            promise.resolve(nil)
          }
        }
      }
    }

    AsyncFunction("presentAchievements") { (promise: Promise) in
      print("[ExpoGameCenter] presentAchievements called")
      
      DispatchQueue.main.async {
        guard let rootViewController = self.getRootViewController() else {
          promise.reject("PRESENTATION_ERROR", "Could not find root view controller")
          return
        }
        
        if #available(iOS 14.0, *) {
          let achievementViewController = GKGameCenterViewController(state: .achievements)
          achievementViewController.gameCenterDelegate = self.gameCenterDelegate
          
          rootViewController.present(achievementViewController, animated: true) {
            promise.resolve(nil)
          }
        } else {
          // Fallback for iOS 13
          let achievementViewController = GKGameCenterViewController()
          achievementViewController.gameCenterDelegate = self.gameCenterDelegate
          achievementViewController.viewState = .achievements
          
          rootViewController.present(achievementViewController, animated: true) {
            promise.resolve(nil)
          }
        }
      }
    }

    AsyncFunction("presentGameCenterViewController") { (promise: Promise) in
      print("[ExpoGameCenter] presentGameCenterViewController called")
      
      DispatchQueue.main.async {
        guard let rootViewController = self.getRootViewController() else {
          promise.reject("PRESENTATION_ERROR", "Could not find root view controller")
          return
        }
        
        if #available(iOS 14.0, *) {
          let gameCenterViewController = GKGameCenterViewController(state: .default)
          gameCenterViewController.gameCenterDelegate = self.gameCenterDelegate
          
          rootViewController.present(gameCenterViewController, animated: true) {
            promise.resolve(nil)
          }
        } else {
          // Fallback for iOS 13
          let gameCenterViewController = GKGameCenterViewController()
          gameCenterViewController.gameCenterDelegate = self.gameCenterDelegate
          gameCenterViewController.viewState = .default
          
          rootViewController.present(gameCenterViewController, animated: true) {
            promise.resolve(nil)
          }
        }
      }
    }
  }
  
  // MARK: - Private Methods
  
  private func setupAuthenticationHandler() {
    guard !hasSetupAuthHandler else { return }
    hasSetupAuthHandler = true
    
    print("[ExpoGameCenter] Setting up authentication handler (once)")
    
    GKLocalPlayer.local.authenticateHandler = { [weak self] viewController, error in
      guard let self = self else { return }
      
      if let error = error {
        print("[ExpoGameCenter] Authentication error: \(error.localizedDescription)")
        if let promise = self.authenticationPromise {
          self.authenticationPromise = nil
          promise.reject("AUTHENTICATION_ERROR", error.localizedDescription)
        }
        return
      }
      
      if let viewController = viewController {
        print("[ExpoGameCenter] Presenting authentication view controller")
        DispatchQueue.main.async {
          guard let rootViewController = self.getRootViewController() else {
            if let promise = self.authenticationPromise {
              self.authenticationPromise = nil
              promise.reject("PRESENTATION_ERROR", "Could not find root view controller")
            }
            return
          }
          
          rootViewController.present(viewController, animated: true) {
            print("[ExpoGameCenter] Authentication view controller presented")
          }
        }
        return
      }
      
      // Authentication completed (success or user cancelled)
      let isAuthenticated = GKLocalPlayer.local.isAuthenticated
      print("[ExpoGameCenter] Authentication completed, result: \(isAuthenticated)")
      
      if let promise = self.authenticationPromise {
        self.authenticationPromise = nil
        promise.resolve(isAuthenticated)
      }
    }
  }
  
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