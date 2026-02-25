export default defineNuxtPlugin(() => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'style') {
        const body = document.body
        // Cuando PrimeVue pone overflow:hidden, cancelamos el padding
        if (body.style.overflow === 'hidden') {
          body.style.setProperty('padding-right', '0px', 'important')
          body.style.setProperty('overflow', 'hidden', 'important')
        }
      }
      if (mutation.attributeName === 'class') {
        const body = document.body
        if (body.classList.contains('p-overflow-hidden')) {
          body.style.setProperty('padding-right', '0px', 'important')
        }
      }
    })
  })

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['style', 'class']
  })
})
