import Image from "next/image";

const Loader = () => {
  return (
    <div className="flex-center">
      <Image
        src="/assets/loader.svg"
        alt="loader"
        className="w-5"
        width={20} // Adjust as needed
        height={20} // Adjust as needed
      />
    </div>
  );
};

export default Loader;
