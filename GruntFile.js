


module.exports = function (grunt) {
  // 项目配置
  grunt.initConfig({



    uglify: {
      minindexjs: {
        src: 'public/js/index.js',
        dest: 'public/js/index.min.js'
      }
    },



    sass: {
        xiaoheicss: {
            files: {
              'public/css/index.xiaohei.css': 'public/css/index.style.scss'
            },
            options: {
              // 无map文件、无缓存目录
              noCache:true,
              sourcemap:'none',
              style: 'compressed'
            }
        }
    },




    htmlmin:{
      options: {
         removeComments: true,
         removeCommentsFromCDATA: true,
         collapseWhitespace: true,
         collapseBooleanAttributes: true,
         removeAttributeQuotes: true,
         removeRedundantAttributes: true,
         useShortDoctype: true,
         removeEmptyAttributes: true,
         removeOptionalTags: true
      },
      index:{
        src: 'views/QQ.html',
        dest: 'views/QQ.min.html'
      }
    },



    watch:{
      js:{
        files:['public/js/index.js'],
        tasks:['uglify:minindexjs']
      },
      css:{
        files:['public/css/index.style.scss'],
        tasks:['sass:xiaoheicss']
      },
      html:{
        files:['views/QQ.html'],
        tasks:['htmlmin:index']
      }
    }



  });




  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');

}