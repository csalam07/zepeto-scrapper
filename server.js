const express = require('express');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;
const request = require('request');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  try {
    return res.status(500).send(`<h1>hello</h1>`);
  } catch (error) {
    return res.status(500).json({ msg: err.message });
  }
});

app.post('/', (req, res) => {
  try {
    const { userName } = req.body;
    request(
      `https://user.zepeto.me/${userName}?language=en`,
      (error, response, html) => {
        if (!error && response.statusCode == 200) {
          const doc = new dom().parseFromString(html);
          const profile_image =
            xpath.select(
              '/html/body/div/div/div[2]/section[1]/div/img',
              doc,
            )[0] || null;
          const name =
            xpath.select(
              '/html/body/div/div/div[2]/section[1]/div/div/div[1]/h2',
              doc,
            )[0] || null;
          const username =
            xpath.select(
              '/html/body/div/div/div[2]/section[1]/div/div/div[2]/p[1]',
              doc,
            )[0] || null;
          const location =
            xpath.select(
              '/html/body/div/div/div[2]/section[1]/div/div/div[2]/p[2]',
              doc,
            )[0] || null;

          const numberOfPost =
            xpath.select(
              '/html/body/div/div/div[2]/section[1]/div/div/ul/li[1]/span[1]/strong',
              doc,
            )[0] || null;
          const numberOfFollowers =
            xpath.select(
              '/html/body/div/div/div[2]/section[1]/div/div/ul/li[2]/span[1]/strong',
              doc,
            )[0] || null;
          const numberOfFollowing =
            xpath.select(
              '/html/body/div/div/div[2]/section[1]/div/div/ul/li[3]/span[1]/strong',
              doc,
            )[0] || null;
          const bio =
            xpath.select('/html/body/div/div/div[2]/section[1]/p', doc)[0] ||
            null;

          if (profile_image && name) {
            const userData = {
              src: profile_image.getAttribute('src'),
              name: name.firstChild.nodeValue,
              username: username.firstChild.nodeValue,
              bio: bio.firstChild.nodeValue,
              numberOfFollowing: numberOfFollowing.firstChild.nodeValue,
              numberOfFollowers: numberOfFollowers.firstChild.nodeValue,
              numberOfPost: numberOfPost.firstChild.nodeValue,
              location: location.firstChild.nodeValue,
            };
            res.status(200).json({ userData });
          } else {
            res.status(400).json({ msg: 'Invalid user name' });
          }
        }
      },
    );
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
