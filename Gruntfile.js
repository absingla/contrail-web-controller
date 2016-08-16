
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: {},
    csslint: {
      options: {
        useBuiltInFormatter: false,
        csslintrc: ".csslintrc",
        formatters: [
          {id: require("csslint-stylish")}
        ]
      },
      dev: {
        src: "./webroot/**/*.css"
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-csslint");

  // Default task(s).
  grunt.registerTask("default", ["csslint"]);
};
