const Comment = require('../models/comment');
const Post = require('../models/post');
const User = require('../models/user');

module.exports.create = async function(req, res){
    try{
        let post = await Post.findById(req.body.post);
        if(post){
            let comment = await Comment.create({
                content: req.body.content,
                user: req.user._id,
                post: req.body.post
            }); 
            post.comments.push(comment);
            post.save();
            let user = await User.findById(comment.user);
            if(req.xhr){
                return res.status(200).json({
                    data: {
                        comment: comment,
                        user_name: user.name
                    },
                    message: 'Comment added!'
                });
            }
            req.flash('success', 'Comment added!');
            return res.redirect('/');
        }
    }
    catch(err){
        req.flash('error', err);
        return res.redirect('back');
    }
}

module.exports.destroy = async function(req, res){
    try{
        let comment = await Comment.findById(req.params.id);
        if(req.user.id == comment.user){
            // Post.findById(comment.post, function(err, post){
            //     let commentIndex = post.comments.findIndex(currcomment => currcomment == req.params.id);
            //     if(commentIndex != -1){
            //         post.comments.splice(commentIndex, 1);
            //         post.save();
            //         // contactList.splice(contactIndex, 1);
            //     }
            // });
            let postId = comment.post;
            comment.remove();
            await Post.findByIdAndUpdate(postId, { $pull: {comments: req.params.id}});

            if(req.xhr){
                return res.status(200).json({
                    data: {
                        comment_id: req.params.id
                    },
                    message: 'Comment removed!'
                });
            }
            req.flash('success', 'Comment removed!');
            return res.redirect('back');
        }
        else{
            req.flash('error', 'You cannot delete this comment');
            return res.redirect('back');
        }
    }
    catch(err){
        req.flash('error', err);
        return res.redirect('back');
    }
}