require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoGameCenter'
  s.version        = package['version']
  s.summary        = 'Custom Expo module for Game Center integration'
  s.description    = 'A custom Expo module that provides native iOS GameKit integration for React Native apps built with Expo'
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = 'https://github.com/expo/expo'
  s.platforms      = { :ios => '13.0', :tvos => '13.0' }
  s.source         = { git: 'https://github.com/expo/expo.git', tag: s.version.to_s }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
  
  # Ensure the module is properly exposed to React Native
  s.preserve_paths = "**/*.swift"
end