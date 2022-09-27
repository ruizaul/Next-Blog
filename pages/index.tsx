import Head from 'next/head';
import Link from 'next/link';
import { sanityClient, urlFor } from '../sanity';
import { Post } from '../typings';
import { Banner } from '../components';
import Image from 'next/image';

interface Props {
  posts: [Post];
}

export default function Home({ posts }: Props) {
  return (
    <>
      <Head>
        <title>SF Blog</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='bg-[url("../public/assets/back.png")] bg-no-repeat bg-cover w-full h-screen absolute -z-10'>
        <div className='max-w-7xl mx-auto mt-2'>
          <Banner />

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 md:p-6'>
            {posts.map((post) => (
              <Link key={post._id} href={`/post/${post.slug.current}`}>
                <div className='group cursor-pointer  shadow-gray-600 shadow-md rounded-lg overflow-hidden'>
                  <Image
                    className='group-hover:scale-105 transition-transform duration-200 ease-in-out'
                    width={500}
                    height={300}
                    layout='responsive'
                    objectFit='cover'
                    priority={true}
                    src={urlFor(post.mainImage).url()!}
                    alt=''
                  />
                  <div className='flex h-full justify-between p-5 bg-gray-100'>
                    <div>
                      <p className='font-mono font-normal'>{post.title}</p>
                      <p className='font-sans font-extralight'>
                        {post.description} by {post.author.name}
                      </p>
                    </div>
                    <div>
                      <Image
                        className='rounded-full'
                        width={48}
                        height={48}
                        src={urlFor(post.author.image).url()!}
                        alt=''
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async () => {
  const query = `*[_type == "post"]{
    _id,
    title,
    author -> {
      name,
      image
    },
      description,
      mainImage,
      slug
  }`;

  const posts = await sanityClient.fetch(query);

  return {
    props: {
      posts,
    },
  };
};

