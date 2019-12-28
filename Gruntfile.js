module.exports = function(grunt) {
    grunt.initConfig({
        'node-minify': {
            gcc: {
                files: {
                    'dist/gModal.min.js': ['src/gModal.js']
                }
            },
        },
        cssmin: {
            target : {
                src: ['src/gModal.css'],
                dest: 'dist/gModal.min.css'
            }
		}
    });
    grunt.loadNpmTasks('grunt-node-minify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('dist', ['node-minify', 'cssmin']);
};
