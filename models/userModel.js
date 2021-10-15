module.exports = mongoose => {
    const User = mongoose.model(
      "user",
      mongoose.Schema(
        {
          username: { type: String, required: true },
          passwordHash: { type: String, required: true },
        },
        { timestamps: true }
      )
    );
    
    return User;
    };