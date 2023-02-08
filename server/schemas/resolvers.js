const { User } = require('../models');
const { signToken} = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
  Query: {

     // get a single user by either their id or their username
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({_id: context.user._id});
        
        return userData;
      }
      throw new AuthenticationError("Cannot find a user with this id!");
    },
  },

   // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return {token, user};
    },

    // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
  // {body} is destructured req.body

    login: async (parent, { email, password }) => {
      const user = await User.findOne({email});
      if (!user) {
        throw new AuthenticationError("Can't find this user" );
      }

      const correctPassword = await user.isCorrectPassword(password);

      if (!correctPassword) {
        throw new AuthenticationError("Wrong password!");
      }

      const token = signToken(user);
      return {token, user};
    },

     // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
  // user comes from `req.user` created in the auth middleware function
    
    saveBook: async (parenet, {book}, context) => {
        if (context.user) {
            return User.findOneAndUpdate(

              {_id: context.user._id},
                {$addToSet: {savedBooks: book},
            },
            {
                new: true,
                runValidators: true,
            }
            );
        }

        throw new AuthenticationError("please login")
    },
    
    removeBook: async (parent, { bookId }, context)  => {
     if (context.user){
        const userData = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: {savedBooks: {bookId}}},
            {new: true} 
            );
            return userData;
     }
     
     throw new AuthenticationError("please login!")
  },

  },
};

module.exports = resolvers;
