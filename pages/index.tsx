import type { NextPage } from "next";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useSWR from "swr";
import { DATA } from "../constants/data";

let inDevelopment = false;

if (process && process.env.NODE_ENV === "development") {
  inDevelopment = true;
}

const fetcher = (args: any) =>
  fetch(args, {
    method: "GET",
    headers: {
      Authorization: "Client-ID b4c20abfbe6d41c",
    },
    redirect: "follow",
  }).then((res) => res.json());

// fetch(
//   "https://api.imgur.com/3/gallery/{{section}}/{{sort}}/{{window}}/{{page}}?showViral={{showViral}}&mature={{showMature}}&album_previews={{albumPreviews}}",
//   requestOptions
// )
//   .then((response) => response.text())
//   .then((result) => console.log(result))
//   .catch((error) => console.log("error", error));

/*
Key 	Required 	Value
section 	optional 	hot | top | user. Defaults to hot
sort 	optional 	viral | top | time | rising (only available with user section). Defaults to viral
page 	optional 	integer - the data paging number
window 	optional 	Change the date range of the request if the section is top. Accepted values are day | week | month | year | all. Defaults to day
*/

/*
curl --location -g --request GET 'https://api.imgur.com/3/gallery/r/{{subreddit}}/{{sort}}/{{window}}/{{page}}' \
--header 'Authorization: Client-ID b4c20abfbe6d41c'
*/

const Container = styled.div`
  padding: clamp(16px, 10%, 100px);
  font-family: "Montserrat", sans-serif;
  background-color: #2e3035;
`;

const Grid = styled.div`
  --columns: 6;
  --gap: 0.5rem;
  display: column;
  columns: var(--columns);
  gap: var(--gap);

  & > * {
    break-inside: avoid;
    margin-bottom: var(--gap);
  }

  @supports (grid-template-rows: masonry) {
    display: grid;
    grid-template-columns: repeat(auto-fill, 240px);
    grid-template-rows: masonry;
    gap: var(--gap);
    justify-content: center;
  }
`;

const ThumbnailText = styled.div`
  display: -webkit-box;
  max-width: 100%;
  margin: 0 auto;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RainbowBorder = styled.div`
  background: rgba(0, 0, 0, 0)
    linear-gradient(
      165deg,
      rgb(105, 216, 202) 0%,
      rgb(53, 146, 255) 50%,
      rgb(156, 49, 255) 100%
    )
    repeat scroll 0% 0%;
  padding: 4px;
`;

const Thumbnail = styled.div`
  background-color: #67696f;
  color: white;
  border-radius: 4px;
  font-weight: 600;
  position: relative;
`;

const ThumbnailContent = styled.div`
  width: 100%;
  overflow: none;
  z-index: 0;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
`;

const ThumbnailImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <Image
      style={{
        transform: "scale(1)",
        borderTopLeftRadius: "4px",
        borderTopRightRadius: "4px",
      }}
      src={src}
      loading="lazy"
      layout="responsive"
      width="100%"
      height="100%"
      objectFit="cover"
      alt={alt}
    />
  );
};

const ThumbnailVideo = ({ src }: { src: string }) => {
  return (
    <video
      width="240px"
      height="auto"
      muted
      autoPlay
      loop
      style={{
        borderTopLeftRadius: "4px",
        borderTopRightRadius: "4px",
      }}
    >
      <source src={src} />
    </video>
  );
};
const Home: NextPage = () => {
  const [filter, setFilter] = useState({
    section: ["hot", "top", "user"],
    sort: ["viral", "top", "time", "rising"],
    page: 1,
    window: ["day", "week", "month", "year", "all"],
  });

  const gridRef = useRef<HTMLDivElement>(null);

  const { data, error } = useSWR(
    process.env.NODE_ENV === "development"
      ? `/api/hello`
      : `https://api.imgur.com/3/gallery/${filter.section[0]}/${filter.sort[0]}/${filter.window[0]}/${filter.page}?showViral=true&mature=true&album_previews=true`,
    fetcher
  );
  console.log({ data, error, dev: process.env.NODE_ENV });
  const onResizeWindow = () => {
    const width = window.innerWidth;
    if (width <= 480) {
      gridRef.current?.style.setProperty("--columns", "1");
    } else if (width > 480 && width <= 1024) {
      gridRef.current?.style.setProperty("--columns", "2");
    } else if (width > 1024 && width <= 1440) {
      gridRef.current?.style.setProperty("--columns", "3");
    } else if (width > 1440 && width <= 1680) {
      gridRef.current?.style.setProperty("--columns", "4");
    } else if (width > 1680 && width <= 2160) {
      gridRef.current?.style.setProperty("--columns", "5");
    } else {
      gridRef.current?.style.setProperty("--columns", "6");
    }
  };

  useEffect(() => {
    if (window !== undefined && gridRef.current) {
      window.addEventListener("resize", onResizeWindow);
    }
    return () => {
      window.removeEventListener("resize", onResizeWindow);
    };
  }, []);

  return (
    <Container>
      <Grid ref={gridRef}>
        {DATA.data.map((item) => {
          if (item.images) {
            return (
              <Thumbnail key={item.id}>
                <ThumbnailContent>
                  {item.images[0].type === "video/mp4" ? (
                    <ThumbnailVideo src={item.images?.[0].link} />
                  ) : (
                    <ThumbnailImage
                      src={item.images?.[0].link}
                      alt={item.title}
                    />
                  )}
                </ThumbnailContent>
                <div style={{ padding: "1rem" }}>
                  <ThumbnailText>{item.title}</ThumbnailText>
                </div>
              </Thumbnail>
            );
          }
        })}
      </Grid>
    </Container>
  );
};

export default Home;
