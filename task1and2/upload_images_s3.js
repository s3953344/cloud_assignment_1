// for this to work, an s3 bucket named "song-images-s3953344" must already have been made.

// code partially adapted from AWS docs
// https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html

import { readFile } from "node:fs/promises";
import {
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";

import axios from "axios";

/**
 * Upload a file to an S3 bucket.
 * @param {{ bucketName: string, key: string, filePath: string }}
 */
export const main = async () => {
  const { songs } = JSON.parse(await readFile('2025a1.json', 'utf8'));
  const client = new S3Client({});
  
  
  try {
    let already_uploaded = {};

    for (const song of songs) {
      // do not allow duplicates
      if (already_uploaded[song.img_url]) continue;
      already_uploaded[song.img_url] = 1;

      const response = await axios.get(song.img_url, {
        responseType: "arraybuffer",
      });


      const contentType = response.headers["content-type"];
      const buffer = response.data;

      const command = new PutObjectCommand({
        Bucket: "song-images-s3953344",
        Key: song.img_url.split("/").at(-1), // get just the name of the image file without the long url behind it
        Body: buffer,
        ContentType: contentType,
      });

      const result = await client.send(command);
      console.log(result);
    }

  } catch (caught) {
    if (
      caught instanceof S3ServiceException &&
      caught.name === "EntityTooLarge"
    ) {
      console.error(
        `Error from S3 while uploading object to ${bucketName}. \
The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
or the multipart upload API (5TB max).`,
      );
    } else if (caught instanceof S3ServiceException) {
      console.error(
        `Error from S3 while uploading object to ${bucketName}.  ${caught.name}: ${caught.message}`,
      );
    } else {
      throw caught;
    }
  }
};

main().catch(console.error);