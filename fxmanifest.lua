fx_version 'cerulean'
name 'New Wheel Framework'
authors {"Kevintjuhz", "BerkieB"}
game 'gta5'
version '0.0.1'

ui_page 'web/build/index.html'

shared_script 'dist/shared/**/*.js'
server_script 'dist/server/**/*.js'
client_script 'dist/client/**/*.js'

files {
    'web/build/index.html',
    'web/build/**/*'
}

dependency 'oxmysql'