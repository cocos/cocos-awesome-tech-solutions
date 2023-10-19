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