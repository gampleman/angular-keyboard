module.exports = function(grunt) {

    grunt.initConfig({
        
        pkg: grunt.file.readJSON('package.json'),
                
        uglify: {
            options: {
                banner: "/**\n * angular-keyboard <%=grunt.config('gitdescribe')[1]%>\n * @author Jakub Hampl\n * @license MIT License http://opensource.org/licenses/MIT\n */\n"
            },
            prod: {
                files: {
                    'build/angular-keyboard.min.js': ['build/angular-keyboard.js']
                }
            }
        },
        
        concat: {
            options: {
                separator: ';',
                banner: "/**\n * angular-keyboard <%=(grunt.config('gitdescribe') && grunt.config('gitdescribe')[1])%>\n * @author Jakub Hampl\n * @license MIT License http://opensource.org/licenses/MIT\n */\n"
            },
            prod: {
                src: ['node_modules/mousetrap/mousetrap.js', 'src/**/*.js'],
                dest: 'build/angular-keyboard.js'
            }
        },        
        
        karma: {
          main: {
            options: {
                keepalive: true,
                configFile: 'karma-angular-1.2.0rc1.conf.js',
                autoWatch: false,
                singleRun: true
            }
          }
            
        },

        "git-describe": {
            run: {
                options: {
                    prop: 'gitdescribe'
                }
            }
        },
        
        ngdocs: {
          all: ['src/**/*.js'],
          options: {
            scripts: ['test/lib/jquery.min.js', 'test/lib/angular-1.2.0rc1/angular.js', 'test/lib/angular-1.2.0rc1/angular-animate.js', 'build/angular-keyboard.js'],
            startPage: '/api/angular-keyboard',
            html5Mode: false
          }
        },
        connect: {
          options: {
            keepalive: true
          },
          server: {}
        },
        
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-git-describe');
    grunt.loadNpmTasks('grunt-ngdocs');
    grunt.loadNpmTasks('grunt-contrib-connect');
        
    grunt.registerTask('default', ['concat:prod']);
    grunt.registerTask('prod', [ 'concat:prod', 'uglify']); //'git-describe:run',
    grunt.registerTask('show-docs', ['concat:prod', 'ngdocs', 'connect'])
};
