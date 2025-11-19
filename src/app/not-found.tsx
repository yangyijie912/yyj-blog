import Link from 'next/link';

const NotFound = () => {
  return (
    <main className="h-screen w-full flex flex-col justify-center items-center bg-[#1A2238]">
      <h1 className="text-9xl font-extrabold text-white tracking-widest">404</h1>
      <div className="bg-[#FFD700] px-2 text-sm rounded rotate-12 absolute">页面未找到</div>
      <button className="mt-5">
        <span className="relative inline-block text-sm font-medium text-[#FFD700] group active:text-orange-500 focus:outline-none focus:ring">
          <span className="absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-[#FFD700] group-hover:translate-y-0 group-hover:translate-x-0"></span>

          <span className="relative block px-8 py-3 bg-[#1A2238] border border-current">
            <Link href="/">返回</Link>
          </span>
        </span>
      </button>
    </main>
  );
};

export default NotFound;
