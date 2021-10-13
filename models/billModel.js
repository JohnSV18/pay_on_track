module.exports = mongoose => {
  const Bill = mongoose.model(
    "bill",
    mongoose.Schema(
      {
        title: String,
        description: String,
        amount: Number,
        due_date: Date,
      },
      { timestamps: true }
    )
  );
  
  return Bill;
  };