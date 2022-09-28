import { GetStaticProps } from 'next';
import { sanityClient, urlFor } from '../../sanity';
import { Post } from '../../typings';
import PortableText from 'react-portable-text';
import { DiscussionEmbed } from 'disqus-react';
import Moment from 'moment';
import Image from 'next/image';

interface Props {
  post: Post;
}

function Post({ post }: Props) {
  const disqusShortname = 'https-sf-nextjs-blog-vercel-app';
  const disqusConfig = {
    url: `https://sf-nextjs-blog.vercel.app/post/`,
    identifier: post.slug.current,
    title: post.title,
  };

  return (
    <main className='flex flex-col'>
      <div>
        <Image
          src={urlFor(post.mainImage).url()!}
          alt=''
          width={200}
          height={40}
          objectFit='cover'
          priority={true}
          layout='responsive'
        />
      </div>
      <article className='max-w-7xl mx-auto p-5'>
        <h1 className='text-3xl text-zinc-300 mt-2 mb-3'>{post.title}</h1>
        <h2 className='text-xl font-light text-yellow-400 mb-5'>{post.description}</h2>
        <div className='flex items-center space-x-2'>
          <Image
            className='rounded-full'
            src={urlFor(post.author.image).url()!}
            alt=''
            width={40}
            height={40}
            objectFit='cover'
          />
          <p className='font-extralight text-sm text-zinc-300'>
            Blog posted by <span className='text-yellow-400'>{post.author.name}</span> - Published
            at&nbsp;{Moment(post._createdAt).toLocaleString()}
          </p>
        </div>

        <div className='mt-10 text-zinc-300'>
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            content={post.body}
            serializers={{
              h1: (props: any) => <h1 className='text-2xl font-bold my-5' {...props} />,
              h2: (props: any) => <h1 className='text-xl font-bold my-5' {...props} />,
              li: ({ children }: any) => <h1 className='ml-4 list-disc'>{children}</h1>,
              link: ({ href, children }: any) => (
                <a href={href} className='text-blue-500 hover:underline'>
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>

      <div className='w-full max-w-[90rem] mt-10 p-8 mb-10 self-center bg-black/30 rounded-3xl text-white'>
        <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
      </div>

      <footer className='p-4 w-full max-w-[100rem] self-center bg-black/30 rounded-t-3xl shadow md:flex md:items-center md:justify-between md:p-6'>
        <span className='text-sm text-yellow-600 sm:text-center'>
          © 2022 Saul Fimbres . All Rights Reserved.
        </span>
        <ul className='flex flex-wrap items-center mt-3 text-sm text-yellow-600 sm:mt-0'>
          <li>
            <a href='#' className='mr-4 hover:underline md:mr-6 '>
              About
            </a>
          </li>
          <li>
            <a href='#' className='hover:underline'>
              Contact
            </a>
          </li>
        </ul>
      </footer>
    </main>
  );
}

export default Post;

export const getStaticPaths = async () => {
  const query = `*[_type == "post"]{
        _id,
        slug {
            current
        }
    }`;
  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == $slug][0]{
        _id,
        _createdAt,
        title,
        author-> {
            name,
            image
        },
        'comments': *[
            _type == 'comment' &&
            post._ref == ^._id &&
            approved == true],
        description,
        mainImage,
        slug,
        body
    }`;

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
    revalidate: 60,
  };
};
