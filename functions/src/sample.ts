export const reqBody = {
  requests: [
    {
      insertText: {
        text: "hello world\n",
        location: {
          index: 1,
        },
      },
    },
    {
      updateTextStyle: {
        textStyle: {
          bold: true,
          backgroundColor: {
            color: {
              rgbColor: {
                red: 0.85,
                green: 0.9,
                blue: 0.96,
              },
            },
          },
          link: {
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          },
        },
        fields: "bold,backgroundColor,link",
        range: {
          startIndex: 1,
          endIndex: 12,
        },
      },
    },
  ],
};
