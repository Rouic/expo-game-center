#import "ExpoGameCenterBridge.h"
#import <GameKit/GameKit.h>
#import <UIKit/UIKit.h>

@implementation ExpoGameCenterBridge

RCT_EXPORT_MODULE(ExpoGameCenter);

RCT_EXPORT_METHOD(isGameCenterAvailable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSLog(@"[ExpoGameCenterBridge] isGameCenterAvailable called");
    // Check if GameCenter is available on the device, not if user is authenticated
    BOOL isAvailable = [GKLocalPlayer class] != nil;
    NSLog(@"[ExpoGameCenterBridge] GameCenter availability: %@", isAvailable ? @"YES" : @"NO");
    resolve(@(isAvailable));
}

RCT_EXPORT_METHOD(authenticateLocalPlayer:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSLog(@"[ExpoGameCenterBridge] authenticateLocalPlayer called");
    
    // If already authenticated, resolve immediately
    if ([GKLocalPlayer localPlayer].isAuthenticated) {
        NSLog(@"[ExpoGameCenterBridge] Already authenticated, returning true");
        resolve(@YES);
        return;
    }
    
    [GKLocalPlayer localPlayer].authenticateHandler = ^(UIViewController *viewController, NSError *error) {
        if (error) {
            NSLog(@"[ExpoGameCenterBridge] Authentication error: %@", error.localizedDescription);
            reject(@"AUTHENTICATION_ERROR", error.localizedDescription, error);
            return;
        }
        
        if (viewController) {
            NSLog(@"[ExpoGameCenterBridge] Presenting authentication view controller");
            dispatch_async(dispatch_get_main_queue(), ^{
                UIViewController *rootViewController = [UIApplication sharedApplication].keyWindow.rootViewController;
                if (rootViewController) {
                    [rootViewController presentViewController:viewController animated:YES completion:^{
                        NSLog(@"[ExpoGameCenterBridge] Authentication view controller presented");
                        // Don't resolve here - wait for the auth handler to be called again after user interaction
                    }];
                } else {
                    NSLog(@"[ExpoGameCenterBridge] No root view controller found");
                    reject(@"PRESENTATION_ERROR", @"Could not find root view controller", nil);
                }
            });
            return;
        }
        
        // This is called after successful authentication or if no UI is needed
        BOOL isAuthenticated = [GKLocalPlayer localPlayer].isAuthenticated;
        NSLog(@"[ExpoGameCenterBridge] Authentication completed, result: %@", isAuthenticated ? @"YES" : @"NO");
        resolve(@(isAuthenticated));
    };
}

RCT_EXPORT_METHOD(getLocalPlayer:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSLog(@"[ExpoGameCenterBridge] getLocalPlayer called");
    
    if (![GKLocalPlayer localPlayer].isAuthenticated) {
        resolve([NSNull null]);
        return;
    }
    
    NSDictionary *playerInfo = @{
        @"playerID": [GKLocalPlayer localPlayer].gamePlayerID ?: @"unknown",
        @"displayName": [GKLocalPlayer localPlayer].displayName ?: @"Player",
        @"alias": [GKLocalPlayer localPlayer].alias ?: @"Player"
    };
    
    resolve(playerInfo);
}

RCT_EXPORT_METHOD(getPlayerImage:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSLog(@"[ExpoGameCenterBridge] getPlayerImage called");
    
    if (![GKLocalPlayer localPlayer].isAuthenticated) {
        NSLog(@"[ExpoGameCenterBridge] Player not authenticated for image");
        resolve([NSNull null]);
        return;
    }
    
    NSLog(@"[ExpoGameCenterBridge] Loading player photo");
    [[GKLocalPlayer localPlayer] loadPhotoForSize:GKPhotoSizeSmall withCompletionHandler:^(UIImage *photo, NSError *error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            if (error) {
                NSLog(@"[ExpoGameCenterBridge] Image load error: %@", error.localizedDescription);
                resolve([NSNull null]);
                return;
            }
            
            if (!photo) {
                NSLog(@"[ExpoGameCenterBridge] No image returned");
                resolve([NSNull null]);
                return;
            }
            
            NSData *imageData = UIImagePNGRepresentation(photo);
            if (!imageData) {
                NSLog(@"[ExpoGameCenterBridge] Failed to convert image to PNG data");
                resolve([NSNull null]);
                return;
            }
            
            NSString *base64String = [imageData base64EncodedStringWithOptions:0];
            NSLog(@"[ExpoGameCenterBridge] Image converted to base64");
            resolve([NSString stringWithFormat:@"data:image/png;base64,%@", base64String]);
        });
    }];
}

RCT_EXPORT_METHOD(submitScore:(NSInteger)score
                  leaderboardID:(NSString *)leaderboardID
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSLog(@"[ExpoGameCenterBridge] submitScore called with score: %ld, leaderboard: %@", (long)score, leaderboardID);
    
    if (![GKLocalPlayer localPlayer].isAuthenticated) {
        reject(@"NOT_AUTHENTICATED", @"Player not authenticated", nil);
        return;
    }
    
    GKScore *scoreReporter = [[GKScore alloc] initWithLeaderboardIdentifier:leaderboardID];
    scoreReporter.value = score;
    
    [GKScore reportScores:@[scoreReporter] withCompletionHandler:^(NSError *error) {
        if (error) {
            reject(@"SCORE_SUBMIT_ERROR", error.localizedDescription, error);
        } else {
            resolve(@YES);
        }
    }];
}

RCT_EXPORT_METHOD(reportAchievement:(NSString *)achievementID
                  percentComplete:(double)percentComplete
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSLog(@"[ExpoGameCenterBridge] reportAchievement called: %@ at %.1f%%", achievementID, percentComplete);
    
    if (![GKLocalPlayer localPlayer].isAuthenticated) {
        reject(@"NOT_AUTHENTICATED", @"Player not authenticated", nil);
        return;
    }
    
    GKAchievement *achievement = [[GKAchievement alloc] initWithIdentifier:achievementID];
    achievement.percentComplete = percentComplete;
    achievement.showsCompletionBanner = YES;
    
    [GKAchievement reportAchievements:@[achievement] withCompletionHandler:^(NSError *error) {
        if (error) {
            reject(@"ACHIEVEMENT_REPORT_ERROR", error.localizedDescription, error);
        } else {
            resolve(@YES);
        }
    }];
}

RCT_EXPORT_METHOD(presentLeaderboard:(NSString *)leaderboardID
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSLog(@"[ExpoGameCenterBridge] presentLeaderboard called with ID: %@", leaderboardID);
    
    dispatch_async(dispatch_get_main_queue(), ^{
        UIViewController *rootViewController = [UIApplication sharedApplication].keyWindow.rootViewController;
        if (!rootViewController) {
            reject(@"PRESENTATION_ERROR", @"Could not find root view controller", nil);
            return;
        }
        
        GKGameCenterViewController *leaderboardViewController = [[GKGameCenterViewController alloc] init];
        leaderboardViewController.gameCenterDelegate = (id<GKGameCenterControllerDelegate>)self;
        leaderboardViewController.viewState = GKGameCenterViewControllerStateLeaderboards;
        leaderboardViewController.leaderboardIdentifier = leaderboardID;
        
        [rootViewController presentViewController:leaderboardViewController animated:YES completion:nil];
        resolve([NSNull null]);
    });
}

RCT_EXPORT_METHOD(presentAchievements:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSLog(@"[ExpoGameCenterBridge] presentAchievements called");
    
    dispatch_async(dispatch_get_main_queue(), ^{
        UIViewController *rootViewController = [UIApplication sharedApplication].keyWindow.rootViewController;
        if (!rootViewController) {
            reject(@"PRESENTATION_ERROR", @"Could not find root view controller", nil);
            return;
        }
        
        GKGameCenterViewController *achievementViewController = [[GKGameCenterViewController alloc] init];
        achievementViewController.gameCenterDelegate = (id<GKGameCenterControllerDelegate>)self;
        achievementViewController.viewState = GKGameCenterViewControllerStateAchievements;
        
        [rootViewController presentViewController:achievementViewController animated:YES completion:nil];
        resolve([NSNull null]);
    });
}

RCT_EXPORT_METHOD(presentGameCenterViewController:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSLog(@"[ExpoGameCenterBridge] presentGameCenterViewController called");
    
    dispatch_async(dispatch_get_main_queue(), ^{
        UIViewController *rootViewController = [UIApplication sharedApplication].keyWindow.rootViewController;
        if (!rootViewController) {
            reject(@"PRESENTATION_ERROR", @"Could not find root view controller", nil);
            return;
        }
        
        GKGameCenterViewController *gameCenterViewController = [[GKGameCenterViewController alloc] init];
        gameCenterViewController.gameCenterDelegate = (id<GKGameCenterControllerDelegate>)self;
        gameCenterViewController.viewState = GKGameCenterViewControllerStateDefault;
        
        [rootViewController presentViewController:gameCenterViewController animated:YES completion:nil];
        resolve([NSNull null]);
    });
}

#pragma mark - GKGameCenterControllerDelegate

- (void)gameCenterViewControllerDidFinish:(GKGameCenterViewController *)gameCenterViewController {
    NSLog(@"[ExpoGameCenterBridge] GameCenter view controller dismissed");
    [gameCenterViewController dismissViewControllerAnimated:YES completion:nil];
}

@end