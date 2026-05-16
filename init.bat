@echo off
cmd.exe /c "npx -y create-next-app@latest temp_app --typescript --eslint --app --src-dir --use-npm --disable-git --yes"
xcopy temp_app . /E /H /C /I /Y
rmdir /S /Q temp_app
del package.json
