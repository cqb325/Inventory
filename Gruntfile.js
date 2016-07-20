/**
 * Created by chenqb on 2015/7/4.
 */
module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            options: {
                globals: {
                    jQuery: true
                }
            },
            files: ['src/js/*.js']
        },
        less: {
            main: {
                files: [{
                    expand: true,
                    cwd: './src/less/',
                    src: ['**/*.less'],
                    dest: './assets/css/',
                    ext: '.css'
                }]
            },
            compileCore: {
                options: {
                    strictMath: true,
                    outputSourceFiles: true
                }
            }
        },
        cssmin: {
            options: {
                compatibility: 'ie8',
                keepSpecialComments: '*',
                advanced: false
            },
            minifyCore: {
                files: [{
                    expand: true,
                    cwd: './assets/css/',
                    src: ['**/*.css','!**/*.min.css'],
                    dest: './assets/css/',
                    ext: '.min.css'
                }]
            }
        },
        babel: {
            options: {
                presets: ['react'],
                "plugins": ["transform-class-properties",
                    "syntax-class-properties"]
            },
            dynamic_mappings: {
                files: [
                    {
                        expand: true,
                        cwd: 'html',
                        src: ['**/*.jsx',"**/**/*.jsx"],
                        dest: 'html',
                        ext: '.js'
                    }
                ]
            },
            libs: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/jsx',
                        src: ['**/*.jsx',"**/**/*.jsx"],
                        dest: 'html/lib',
                        ext: '.js'
                    }
                ]
            }
        },

        watch: {
            jsx: {
                files: ['src/**/*.jsx','html/**/*.jsx'],
                tasks: ["babel"]
            },
            files: ['src/less/**/*.less'],
            tasks: ["less",'cssmin']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-babel');

    // 只需在命令行上输入"grunt"，就会执行default task
    grunt.registerTask('default', ['less','cssmin']);
};
