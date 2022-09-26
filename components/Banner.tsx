export const Banner = () => {
  return (
    <div className='flex justify-center items-center border-2 border-black bg-yellow-100'>
      <div className='px-5 space-y-5'>
        <h1 className='px-5 py-6 text-4xl text-gray-800 w-full font-mono'>
          Welcome to the most awesome blog, built with Next.js, Typescript, Sanity and Tailwind CSS
          ❤️
        </h1>
        <h2 className='px-6 py-6 text-gray-800 font-mono w-full'>
          Feel free to post anything you want to share :D.
        </h2>
      </div>
    </div>
  );
};
