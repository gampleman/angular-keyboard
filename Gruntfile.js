module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        banner: "/**\n * angular-keyboard <%=grunt.config('gitdescribe')%>\n * @license MIT License http://opensource.org/licenses/MIT\n */\n"
      },
      prod: {
        files: {
          'build/angular-keyboard.min.js': ['build/angular-keyboard.js'],
          'build/angular-keyboard-minimal.js' : ['build/angular-keyboard-minimal.js']
        }
      }
    },

    concat: {
      options: {
        separator: ';',
        banner: "/**\n * angular-keyboard <%=(grunt.config('gitdescribe') && grunt.config('gitdescribe')[1])%>\n * @license MIT License http://opensource.org/licenses/MIT\n */\n"
      },
      prod: {
        src: ['node_modules/mousetrap/mousetrap.js', 'src/**/*.js'],
        dest: 'build/angular-keyboard.js'
      },
      minimal: {
        src: ['node_modules/mousetrap/mousetrap.js', 'src/index.js', 'src/keyboard-shortcuts.js', 'src/keyboard-shortcut.js'],
        dest: 'build/angular-keyboard-minimal.js'
      }
    },

    karma: {
      main: {
        options: {
          keepalive: true,
          configFile: 'karma.conf.js',
          autoWatch: true
        }
      },
      once: {
        options: {
          configFile: 'karma.conf.js',
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
      options: {
      scripts: ['bower_components/jquery/dist/jquery.min.js', 'bower_components/angular/angular.min.js', 'bower_components/angular-animate/angular-animate.min.js', 'build/angular-keyboard.js'],
      startPage: '/api/angular-keyboard',
      html5Mode: false
      },
      all: {
      src: ['src/**/*.js'],
      title: 'angular-keyboard',
      api: true
      }
    },

    connect: {
      options: {
      keepalive: true
      },
      server: {}
    },

    'gh-pages': {
      options: {
      base: 'docs'
      },
      src: ['**']
    },

    clean: ['docs']
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-git-describe');
  grunt.loadNpmTasks('grunt-ngdocs');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['git-describe:run', 'concat:prod', 'concat:minimal', 'uglify']);
  grunt.registerTask('prod', ['git-describe:run', 'concat:prod', 'concat:minimal', 'uglify', 'ngdocs:all', 'gh-pages', 'clean']);
  grunt.registerTask('show-docs', ['concat:prod', 'concat:minimal', 'ngdocs:all', 'connect'])
};
