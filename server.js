const app = require("express")();
const express=require("express")
const fs = require("fs");
app.set("view engine", "ejs")

const port = process.env.port || 5000

app.get("/", (req,res) => {
    res.render("index")
})

app.get("/video", (req, res) => {
    const range = req.headers.range
    if (!range) {
        res.status(400).send("requires header range.")
        return
    }

    const videoPath = "video.mp4"
    const videoSize = fs.statSync(videoPath).size
    const chunkSize = 10 ** 6
    const start = Number(range.replace(/\D/g, ""))
    const end = Math.min(start + chunkSize, videoSize - 1)
    const contentLength = end - start + 1
    const headers = {
        "Content-Range": `bytes ${start} -${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4"
    }
    res.writeHead(206, headers)
    const videoStream = fs.createReadStream(videoPath, { start, end })
    videoStream.pipe(res)
});

app.use(express.raw({ type: 'video/*', limit: '50mb' })); // Increase the limit as needed

app.post('/upload', (req, res) => {
    //console.log(req.file)
    const filePath = `./ videoupload /${ req.file }`;

    const writeStream = fs.createWriteStream(filePath, { flags: 'a' }); // 'a' for append

    req.on('data', (chunk) => {
        console.log(chunk)
        writeStream.write(chunk);
    });

    req.on('end', () => {
        writeStream.end();
        res.status(200).json({ message: 'Video uploaded successfully' });
    });
});

app.listen(port, () => {
    console.log("server started")
});