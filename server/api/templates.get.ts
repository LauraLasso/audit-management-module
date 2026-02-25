import { TEMPLATES } from './_data'

export default defineEventHandler(async () => {
  await delay()
  mayFail()
  return TEMPLATES
})

function delay () {
  return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 900))
}
function mayFail () {
  if (Math.random() < 0.12) { throw createError({ statusCode: 500, statusMessage: 'Simulated server error' }) }
}
