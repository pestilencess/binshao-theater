@echo off
chcp 65001 >nul
cd /d "%~dp0"
title BinShao Theater - LAN Server
echo ==================================================
echo    彬少剧场 · 局域网联机服务器
echo ==================================================
echo.
echo  [1] 自己电脑玩:  http://127.0.0.1:8642/
echo.
echo  [2] 好友手机玩 (必须连同一个WiFi):
echo      手机浏览器打开下面任意一个地址
echo.
ipconfig | findstr /i "IPv4"
echo.
echo      例如:  http://192.168.1.100:8642/
echo      (把上面的 IP 填进去, 端口是 8642)
echo.
echo  提示: 首次启动如弹出防火墙提示, 请点"允许访问"
echo.
start "" "http://127.0.0.1:8642/"
python -m http.server 8642
pause
