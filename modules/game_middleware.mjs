export function loadGame(games) {
    
    return function (req, res, next) {
        
        const gameId = Number(req.params.id);
        const game = games.find(g => g.id === gameId);
        
        if (!game) {
            return res.status(404).json({ error: "Game not found" });
        }
        
        req.game = game;

        next();
    }; 
}

export function requirePlayer(req, res, next) {
     
    const isPlayer = req.game.players.some(
        p => p.userId === req.user.id
    );
    
    if (!isPlayer) {
        return res.status(403).json({ error: "Access denied" });
    } 
    
    next(); 
} 

export function forbidIfFinished(req, res, next) {
    
    if (req.game.status === "finished") {
        return res.status(409).json({ error: "Game is finished" });
    }
    
    next();
}

export function requireGameOwner(req, res, next) {

    if (req.game.ownerId !== req.user.id) {
        return res.status(403).json({ error: "Only owner can perform this action" });
    }
    
    next();
}