本方案基于 CocosCreator 3.4.0 版本实现。

- android
    - 构建出 android 包之后，修改 AppActivity.java 文件中的代码，添加 setOrientation 函数。
    函数代码如下：
    ```
    public static void setOrientation(String dir) {
        if (dir.equals("V"))
            GlobalObject.getActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
        else
            GlobalObject.getActivity().setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
    }
    ```
- ios
    - 构建出 ios 包之后，修改 AppDelegate.mm 文件中的代码，添加 setOrientation 函数。
    函数代码如下：
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

    继续修改 ViewController.mm 文件，注释
    ```
    namespace {
        cc::Device::Orientation _lastOrientation;
    }
    ```
    之后修改 viewWillTransitionToSize 函数的代码为：
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