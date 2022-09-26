import { GetStaticProps } from 'next';
import { sanityClient, urlFor } from '../../sanity';
import { Post } from '../../typings';
import PortableText from 'react-portable-text';
import Script from 'next/script';

interface Props {
  post: Post;
}

function Post({ post }: Props) {
  return (
    <main>
      <img className='w-full h-40 object-cover' src={urlFor(post.mainImage).url()!} alt='' />
      <article className='max-w-3xl mx-auto p-5'>
        <h1 className='text-3xl text-zinc-300 mt-2 mb-3'>{post.title}</h1>
        <h2 className='text-xl font-light text-yellow-400 mb-2'>{post.description}</h2>
        <div className='flex items-center space-x-2'>
          <img className='h-10 w-10 rounded-full' src={urlFor(post.author.image).url()!} alt='' />
          <p className='font-extralight text-sm text-zinc-300'>
            Blog posted by <span className='text-yellow-400'>{post.author.name}</span> - Published
            at&nbsp;{new Date(post._createdAt).toLocaleString()}
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
      <div id='disqus_thread' className='mt-8 p-8 mb-auto bg-zinc-200 rounded-t-3xl'>
        <Script>
          {`var disqus_config = function () {
    this.page.url = document.location.href;  // Replace PAGE_URL with your page's canonical URL variable
    this.page.identifier = {post.slug} // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };
    
    (function() { // DON'T EDIT BELOW THIS LINE
    var d = document, s = d.createElement('script');
    s.src = 'https://https-sf-nextjs-blog-vercel-app.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
    })();`}
        </Script>
      </div>
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
