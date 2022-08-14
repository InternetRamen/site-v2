import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import base from '../../lib/base'; // airtable

import Masonry from "react-masonry-css";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ScrapbookPage() {
  const [loading, setLoading] = React.useState(true);
  const [latestScraps, setLatestScraps] = React.useState<readonly any[]>([]);

  React.useEffect(() => {
    fetchLatestScraps();
  }, []);

  async function fetchLatestScraps() {
    await base('Scraps').select({
      pageSize: 16,
      //maxRecords: 80,
      view: 'Grid view',
      sort: [{ field: 'Created time', direction: 'desc' }]
    }).eachPage((records, fetchNextPage) => {
      setLatestScraps(records);
      fetchNextPage();
    }, (err) => {
      setLoading(false);
      if (err) { console.error(err); return; }
    });
  }

  return <>
    <Head>
      <title>Scrapbook – Blair Hack Club</title>
      {/* <meta name="description" content="by @linkai101 on github" /> */}
    </Head>

    <Navbar type="scrapbook"/>

    <header className="px-8 pt-28 pb-14 flex flex-col items-center">
      <h1 className="text-3xl sm:text-5xl text-amber-400 font-extrabold font-fancy italic leading-tight text-center">
        Blair Hack Club's Scrapbook
      </h1>
      <p className='text-lg text-center mt-2'>
        A daily diary of what Hack Clubbers at Blair HS are learning &amp; making every day.
      </p>
    </header>

    <main className="container max-w-6xl p-8">
      <Masonry
        breakpointCols={{ default:4, 1024:3, 768:2, 640:1 }}
        className="masonry-grid w-full"
        columnClassName="masonry-column"
      >
      {latestScraps.map(scrap =>
        <div className="p-4 flex flex-col gap-3 bg-theme-surface rounded-xl" key={scrap.id}>
          <div className="flex items-center gap-4">
            <img
              className="w-12 h-12 rounded-full"
              src={scrap.fields["Avatar (from User)"]?.[0].thumbnails.large.url}
              alt={`Avatar of ${scrap.fields["Username (from User)"]}`}
              />
            <div>
              <h3 className="font-bold leading-5">
                <Link href={`/scrapbook/${scrap.fields["Username (from User)"]}`} passHref>
                  <a>
                    @{scrap.fields["Username (from User)"]}
                  </a>
                </Link>
              </h3>
              <p className="text-neutral-400 text-sm">
                {formatDate(new Date(scrap.fields["Created time"]))}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm">
              {scrap.fields["Description"]}
            </p>

            <div className={`grid ${scrap.fields["Attachments"]?.length > 1 && "grid-cols-2"} gap-4 items-center`}>
              {scrap.fields["Attachments"]?.map((attachment: any) => {
                if (["image/png", "image/jpeg", "image/svg+xml"].includes(attachment.type))
                return <img
                  className="rounded-xl"
                  src={attachment.url}
                  alt={attachment.filename}
                  key={attachment.id}
                />;
                // TODO: add support for other file types
                return <span // unsupported file type
                className="text-sm text-neutral-400 italic"
                key={attachment.id}
                >
                  💾 {attachment.filename}
                </span>;
              })}
            </div>
          </div>
        </div>
      )}
      </Masonry>
    </main>

    <Footer/>
  </>;
}

function formatDate(date: Date) {
  // if recent, show hh:mm
  return date.toLocaleDateString('en-us', { weekday: "short", month: "short", day: "numeric" }) 
}