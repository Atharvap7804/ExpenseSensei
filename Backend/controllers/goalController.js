







const Goal = require("../models/Goal");
exports.createGoal = async (req, res) => {
  try {
    const { title, target, months } = req.body;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, msg: "Unauthorized" });
    }
    const installment = Math.ceil(target / months);
    const newGoal = new Goal({
      user: req.user.id,
      title,
      target,
      installment,
      months,
      current: 0,
      createdAt: new Date()
    });
    await newGoal.save();
    res.status(201).json({ success: true, goal: newGoal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user found in request" });
    }
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, goal: goals });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: error.message })
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const goalId = req.params.id;
    const userId = req.user.id;
    const goal = await Goal.findOneAndDelete({ _id: goalId, user: userId });
    if (!goal) {
      return res.status(404).json({ success: false, msg: "Goal not found or unauthorized" });
    }
    res.json({ success: true, msg: "Goal terminated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



exports.contributeToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    const contribution = parseFloat(amount);

    if (isNaN(contribution) || contribution <= 0) {
      return res.status(400).json({ success: false, msg: "Invalid contribution amount" });
    }

    // Atomic update to increment progress
    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      { $inc: { current: contribution } }, 
      { new: true, runValidators: true }
    ).populate('user');
    
    if (!goal) return res.status(404).json({ success: false, msg: "Goal not found" });

    // Automated Email Trigger
    if (goal.current >= goal.target) {
      const mailOptions = {
        from: `"Sensei Milestones" <${process.env.EMAIL_USER}>`,
        to: goal.user.email,
        subject: `Objective Accomplished: ${goal.title}! 🏆`,
        html: `
          <div style="font-family: sans-serif; background: #050505; color: white; padding: 40px; border-radius: 30px; text-align: center;">
            <h1 style="color: #22c55e;">MISSION ACCOMPLISHED</h1>
            <p>Your objective <b>${goal.title}</b> is now fully funded.</p>
            <div style="background: #18181b; padding: 30px; border-radius: 20px; margin: 25px 0;">
              <h2 style="margin: 0; font-size: 42px;">₹${goal.current.toLocaleString()}</h2>
            </div>
          </div>`
      };
      transporter.sendMail(mailOptions).catch(err => console.error("Mail Error:", err));
    }
    
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};