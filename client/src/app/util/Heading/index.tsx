type HeadingProps = {
    name: string;
  };
  
  const Heading = ({ name }: HeadingProps) => {
    return <h1 className="text-2xl font-semibold text-gray-900 px-4">{name}</h1>;
  };
  
  export default Heading;