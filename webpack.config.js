const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const BASE_JS = "./src/client/js/";

module.exports = {
    // entry는 우리가 전환하고자 하는 파일
    entry : {
        // main : "./src/client/js/main.js",
        // videoPlayer : "./src/client/js/videoPlayer.js",
        // recorder : "./src/client/js/recorder.js"
        main : BASE_JS + "main.js",
        videoPlayer : BASE_JS + "videoPlayer.js",
        recorder : BASE_JS + "recorder.js",
        commentSection : BASE_JS + "commentSection.js"
    },
    // mode : 'development',
    // watch : true, watch는 development 모드에서만 true
    plugins: [new MiniCssExtractPlugin({
        filename : "css/styles.css",
    })],
    // output은 전환된 파일의 이름 및 저장 경로
    output : {
        // [name]은 entry에 있는 이름을 가져감
        filename : "js/[name].js",
        path : path.resolve(__dirname, "assets"),
        // webpack 을 재시작하면 경로 폴더 삭제 후 다시 만듦
        clean : true,
    },
    module: {
        rules: [
          {
            test: /\.js$/,
            use: {
              loader: "babel-loader",
              options: {
                presets: [["@babel/preset-env", { targets: "defaults" }]],
              },
            },
          },
          {
            test: /\.scss$/,
            // webpack은 뒤에서부터 시작한다.
            // sass > css > style 순
            use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
          },
        ],
      },
};
