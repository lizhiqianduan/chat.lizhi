


module.exports = function (grunt) {
  // 项目配置
  grunt.initConfig({
    uglify: {
      
      minindexjs: {
        src: 'public/js/index.js',
        dest: 'public/js/index.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

}