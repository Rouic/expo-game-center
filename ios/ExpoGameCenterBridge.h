#import <React/RCTBridgeModule.h>
#import <GameKit/GameKit.h>

@interface ExpoGameCenterBridge : NSObject <RCTBridgeModule, GKGameCenterControllerDelegate>

@end