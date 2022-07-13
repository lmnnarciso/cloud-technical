import type { NextPage } from "next";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useSWR from "swr";

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
    sort: ["time", "top"],
    page: 1,
    window: ["day", "week", "month", "year", "all"],
  });

  const gridRef = useRef<HTMLDivElement>(null);

  const { data, error } = useSWR(
    process.env.NODE_ENV === "development"
      ? `/api/hello`
      : `https://api.imgur.com/3/gallery/r/pics/${filter.sort[0]}/${filter.window[1]}/${filter.page}`,
    fetcher
  );

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

  if (!data) {
    return <>Loading...</>;
  }

  if (error) {
    return <>Error</>;
  }

  return (
    <Container>
      <Grid ref={gridRef}>
        {data.data.map((item: any) => {
          return (
            <Thumbnail key={item.id}>
              <ThumbnailContent>
                {item.type === "video/mp4" ? (
                  <ThumbnailVideo src={item.link} />
                ) : (
                  <ThumbnailImage src={item.link} alt={item.title} />
                )}
              </ThumbnailContent>
              <div style={{ padding: "1rem" }}>
                <ThumbnailText>{item.title}</ThumbnailText>
              </div>
            </Thumbnail>
          );
        })}
        <button
          onClick={() => {
            setFilter({
              ...filter,
              page: filter.page + 1,
            });
          }}
        >
          Load more
        </button>
      </Grid>
    </Container>
  );
};

export default Home;
