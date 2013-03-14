var exec = require('child_process').exec;

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    mocha: {
      all: ["test/unit/**/*.html", "test/acceptance/**/*.html", "test/integration/**/*.html"],
      unit: ["test/unit/**/*.html"],
      acceptance: ["test/acceptance/**/*.html"],
      integration: ["test/integration/**/*.html"]
    },

    // For more RequireJS options refer to https://github.com/jrburke/r.js/blob/master/build/example.build.js
    requirejs: {
      compile: {
        options: {
          name: 'main',
          baseUrl: "tmp/js/",
          mainConfigFile: "tmp/js/main.js",
          out: "deploy/js/gam.js",
          optimize: "none"
        }
      }
    },
    less: {
      'development': {
          files: {
            "source/css/base.css": "source/less/base.less"
          }
      }
    },
    concat: {
      js: {
        src: [
          "<banner:meta.banner>",
          "deploy/js/gam.js"
        ],
        dest: "deploy/js/gam-<%= pkg.version %>.js"
      },
      // We don't need to do this, as the LESS compiler will put all of our files together.
      css: {
        src: [
          "<banner:meta.banner>",
          "source/css/bootstrap.css",
          "source/css/datepicker.css",
          "source/css/chosen.css",
          "source/css/base.css"
        ],
        dest: "deploy/css/gam-<%= pkg.version %>.css"
      }
    },
    uglify: {
      options: {
        squeeze: {'make_seqs': false}
      },
      js: {
        files: {
          'deploy/js/gam-<%= pkg.version %>.min.js': ['deploy/js/gam-<%= pkg.version %>.js']
        }
      }
    },
    mincss: {
      compress: {
        files: {
          "deploy/css/gam-<%= pkg.version %>.min.css": ["deploy/css/gam-<%= pkg.version %>.css"]
        }
      }
    },
    clean: {
      options: {
        force: true
      },
      all: ['deploy/**/*', 'tmp/**/*'],
      release: ['tmp/', 'deploy/css/gam.css', 'deploy/js/gam.js']
    },
    copy: {
      dev: {
        files: [
          {expand: true, cwd: 'source/', src: ['**'], dest: 'deploy/'}
        ]
      },
      stage: {
        files: [
          {expand: true, cwd: 'source/', src: ['**'], dest: 'tmp/'}
        ]
      },
      release: {
        files: [
          {expand: true, cwd: 'tmp/', src: ['font/**', 'img/**', '*.ico', 'js/vendor/require-jquery.js', 'index.html'], dest: 'deploy/'}
        ]
      }
    },
    replace: {
      'dev': {
        options: {
          variables: {
            'css': '/css/gam-<%= pkg.version %>.css',
            'main': '/js/main',
            'require': '/js/vendor/require-jquery.js'
          },
          prefix: '@@'
        },
        files: {
          'deploy/index.html': ['source/index.html']
        }
      },
      'release': {
        options: {
          variables: {
            'css': '/css/gam-<%= pkg.version %>.min.css',
            'main': '/js/gam-<%= pkg.version %>.min.js',
            'require': '/js/vendor/require-jquery.js'
          },
          prefix: '@@'
        },
        files: {
          'tmp/index.html': ['source/index.html']
        }
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        forin: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        noempty: true,
        nonew: true,
        regexp: true,
        undef: true,
        trailing: true,
        boss: true,
        browser: true,
        jquery: true,
        node: true
      },
      globals: {},
      grunt: {
        options: this.options,
        globals: {
          'task': true,
          'config': true,
          'file': true,
          'log': true,
          'template': true
        }
      },
      src: {
        options: this.options,
        globals: {
          '$': true,
          '_': true
        }
      },
      test: {
        options: this.options,
        globals: {
          '$': true,
          '_': true,
          'module': true,
          'chai': true,
          'mocha': true
        }
      }
    },
    watch: {
      src: {
        files: ['source/**'],
        tasks: ['jshint:src', 'default']
      },
      test: {
        files: ['test/**'],
        tasks: ['jshint:test', 'test']
      }

    }
  });

  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-mincss');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-replace');


  // Alias'
  // --------------------------------------------------
  // grunt.registerTask('test', ['mocha:all']);
  // grunt.registerTask('test:unit', ['mocha:unit']);
  // grunt.registerTask('test:integration', ['mocha:integration']);
  // grunt.registerTask('test:acceptance', ['mocha:acceptance']);
  grunt.registerTask('development', ['development:gam']);
  grunt.registerTask('gam', ['development:gam']);
  grunt.registerTask('release', ['release:gam']);

  // Default Task.
  grunt.registerTask("default", ['development:gam']);

  // Development Tasks
  // --------------------------------------------------
  grunt.registerTask('development:gam', ['clean:all', 'copy:dev', 'less', 'concat:css', 'replace:dev', 'test']);

  // Release Tasks
  // --------------------------------------------------
  grunt.registerTask('release:gam', ['clean:all', 'copy:stage', 'requirejs', 'less', 'concat', 'uglify', 'mincss', 'replace:release','copy:release', 'clean:release', 'test']);
};
