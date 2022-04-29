This solution is based on CocosCreator version 3.4.0.

- android
    - After building out the android package, modify the code in the `AppActivity.java` file to add the `setOrientation` function.
    The function code is as follows:
    ```
    public static void setOrientation(String dir) {
        if (dir.equals("V"))
            GlobalObject.getActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
        else
            GlobalObject.getActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
    }
    ```
- ios
    - After building out the ios package, modify the code in the `AppDelegate.mm` file to add the `setOrientation` function.
    The function code is as follows:
    ```
    UIInterfaceOrientationMask oMask = UIInterfaceOrientationMaskLandscape;
    
    -(UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window{
        return oMask;
    }

    +(void)setOrientation:(NSString*)dir{
    
        if([dir isEqualToString:@"V"]){
            oMask = UIInterfaceOrientationMaskPortrait;
            [[UIDevice currentDevice] setValue:[NSNumber numberWithInteger:UIInterfaceOrientationPortrait] forKey:@"orientation"];
        }   
        else{
            oMask = UIInterfaceOrientationMaskLandscape;
            [[UIDevice currentDevice] setValue:[NSNumber numberWithInteger:UIInterfaceOrientationLandscapeRight] forKey:@"orientation"];
        }
    }
    ```

    Continue to modify the ViewController.mm file
    ```
    namespace {
        cc::Device::Orientation _lastOrientation;
    }
    ```
    Then modify the code of the viewWillTransitionToSize function as follows:
    ```
    cc::Device::Orientation orientation = _lastOrientation;
    // reference: https://developer.apple.com/documentation/uikit/uiinterfaceorientation?language=objc
    // UIInterfaceOrientationLandscapeRight = UIDeviceOrientationLandscapeLeft
    // UIInterfaceOrientationLandscapeLeft = UIDeviceOrientationLandscapeRight
    switch ([UIDevice currentDevice].orientation) {
        case UIDeviceOrientationPortrait:
            orientation = cc::Device::Orientation::PORTRAIT;
            break;
        case UIDeviceOrientationLandscapeRight:
            orientation = cc::Device::Orientation::LANDSCAPE_LEFT;
            break;
        case UIDeviceOrientationPortraitUpsideDown:
            orientation = cc::Device::Orientation::PORTRAIT_UPSIDE_DOWN;
            break;
        case UIDeviceOrientationLandscapeLeft:
            orientation = cc::Device::Orientation::LANDSCAPE_RIGHT;
            break;
        default:
            break;
    }
    if (_lastOrientation != orientation) {
        cc::EventDispatcher::dispatchOrientationChangeEvent((int) orientation);
        _lastOrientation = orientation;
    }
    ```
