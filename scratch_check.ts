import fs from 'fs'
const schema = fs.readFileSync('/Users/rafayraza/Desktop/dataEntry/data-entry-app/prisma/schema.prisma', 'utf-8')
console.log(schema.includes('rescheduledToId'))
