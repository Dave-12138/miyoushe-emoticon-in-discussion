set targ=%1
if not defined targ set targ=out.user.js
copy .\miyoushe-emot-to-github.user.js %targ%
echo. >> %targ%
echo GM_addStyle(` >> %targ%
for /f "delims=" %%i in (.\style.css) do @echo %%i >> %targ%
echo `); >> %targ%