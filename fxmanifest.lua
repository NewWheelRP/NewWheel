fx_version 'cerulean'
name 'New Wheel Framework'
authors {"Kevintjuhz", "BerkieB"}
game 'gta5'

ui_page 'web/build/index.html'

server_script 'dist/server/**/*.js'
client_script 'dist/client/**/*.js'

files {
    'web/build/index.html',
    'web/build/**/*'
}

dependency 'oxmysql'