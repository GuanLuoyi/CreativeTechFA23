# An AI Images Generating Platform using openAI API
Inspired by Sofia Crespo's project: https://thisjellyfishdoesnotexist.com/
## Project's Diagram
![diagram](https://github.com/GuanLuoyi/CreativeTechFA23/assets/95225808/1d708a38-b957-4e38-ac5e-60a4b9219dcf)
## Images Generating
```
const getImages = async () => {
    const options = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            prompt: inputElement.value,
            n: 4,
            size: "1024x1024"
        })
    }
    try{
        const response = await fetch('https://api.openai.com/v1/images/generations',options)
        const data = await response.json()
        data?.data.forEach(imageObject => {
            //Get images' urls and append them into the images-section
        })
    } catch (error) {
        console.error(error)
    }
}
```
## Flowmap Effect
This part I use a powerful and minimal WebGL API called OGL to create an interactive fluid distortion hover effect.  
### [OGL API](https://github.com/oframe/ogl)

## Outcome


https://github.com/GuanLuoyi/CreativeTechFA23/assets/95225808/b859cfb4-484c-4ec5-9567-f6c73a258589


