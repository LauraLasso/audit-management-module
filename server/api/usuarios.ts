// Este código se ejecuta solo en el servidor (Node.js), es seguro.
export default defineEventHandler(async (_event) => {
  // Aquí podrías poner claves secretas o tokens de seguridad
  const data = await $fetch('https://jsonplaceholder.typicode.com/users')

  // Devolvemos los datos limpios al front-end
  return data
})
