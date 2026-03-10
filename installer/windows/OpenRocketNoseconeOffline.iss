#define AppName "OpenRocket Nosecone Unfolder Offline"

#ifndef AppVersion
  #define AppVersion "0.1.0"
#endif

#ifndef SourceDir
  #define SourceDir "..\\..\\offline-dist"
#endif

#ifndef OutputDir
  #define OutputDir "..\\..\\release\\windows"
#endif

[Setup]
AppId={{5CB17328-B8A8-4F5C-853D-AED5BE31CD20}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher=OpenRocket Nosecone Unfolder Offline
DefaultDirName={localappdata}\OpenRocket Nosecone Unfolder Offline
DefaultGroupName=OpenRocket Nosecone Unfolder Offline
PrivilegesRequired=lowest
OutputDir={#OutputDir}
OutputBaseFilename=OpenRocketNoseconeUnfolder-Setup-{#AppVersion}
Compression=lzma
SolidCompression=yes
WizardStyle=modern
DisableDirPage=no
DisableProgramGroupPage=no

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: recursesubdirs ignoreversion

[Icons]
Name: "{group}\OpenRocket Nosecone Unfolder Offline"; Filename: "{app}\Start-App.bat"
Name: "{userdesktop}\OpenRocket Nosecone Unfolder Offline"; Filename: "{app}\Start-App.bat"

[Run]
Filename: "{app}\Start-App.bat"; Description: "Launch OpenRocket Nosecone Unfolder Offline"; Flags: postinstall nowait skipifsilent
