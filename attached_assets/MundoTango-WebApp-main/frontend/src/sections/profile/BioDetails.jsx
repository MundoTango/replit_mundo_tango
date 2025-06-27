const BioDetails = ({ bioDetails }) => {
  return (
    <section className="mt-4">
      <p className="font-bold">Intro/Bio</p>
      <p className="text-gray-text-color">{bioDetails}</p>
    </section>
  );
};

export default BioDetails;
