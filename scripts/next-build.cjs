require('./node-readlink-compat.cjs')

process.argv = [process.argv[0], 'next', 'build']
require('next/dist/bin/next')
