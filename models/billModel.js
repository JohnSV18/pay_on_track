module.exports = mongoose => {
  const Bill = mongoose.model(
    "bill",
    mongoose.Schema(
      {
        title: { type: String, required: true },
        description:{ type: String, minlength: 5, maxlength:20, required: true },
        amount: { type: Number, required: true },
        due_date: Date,
      },
      { timestamps: true }
    )
  );
  
  return Bill;
  };