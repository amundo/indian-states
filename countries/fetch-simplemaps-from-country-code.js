import {DOMParser} from '@b-fuze/deno-dom'


let fetchSimpleMapsFromCountryCode = async (code) => {
  let url = `https://simplemaps.com/svg/country/${code}`

  const response = await fetch(url)
  const html = await response.text()
  let dom = new DOMParser().parseFromString(html, 'text/html')
  let downloadLink = dom.querySelector('#admin1 > p:nth-child(5) > a:nth-child(1)')
  let linkHref = downloadLink.getAttribute('href')
  let absoluteUrl = new URL(linkHref, url).href

  let response2 = await fetch(absoluteUrl)
  let xml = await response2.text()

  Deno.writeTextFileSync(`${code}.svg`, xml)
  console.log(`SVG file for ${code} saved as ${code}.svg`)
}



if(import.meta.main){
  let code = Deno.args[0]
  await fetchSimpleMapsFromCountryCode(code)
}

export {fetchSimpleMapsFromCountryCode}