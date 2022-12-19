#pragma once
#include <iostream>

#include "ATarget.hpp"

class BrickWall : public ATarget
{
    public:
        BrickWall(void);
        ~BrickWall();
        
        virtual ATarget *clone() const;
};