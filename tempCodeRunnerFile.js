res.redirect(req.get('referer') + '?response=Invalid email or password');
            console.log('Teacher Login failed.', result);