const BrandedLayout = () => {
  return (
    // Added overflow-hidden so the image respects the rounded corners
    <div className="h-[90%] w-[35%] rounded-4xl overflow-hidden">
      <img
        src="/ZapBranded.png" // Removed "/public" so the bundler can resolve it correctly
        className="w-full h-full object-cover"
        alt="Branded Layout"
      />
    </div>
  );
};

export default BrandedLayout;
