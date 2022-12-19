#pragma once

#include <iostream>
#include <map>
#include "ATarget.hpp"
#include "ATarget.hpp"

class TargetGenerator
{
    private:
        TargetGenerator &operator=(TargetGenerator const &other);
        TargetGenerator(TargetGenerator const &other);
        std::map<std::string, ATarget *> list;
    public:
        ~TargetGenerator();
        TargetGenerator(void);

        void    learnTargetType(ATarget *other);
        void    forgetTargetType(std::string const &name);
        ATarget* createTarget(std::string const &namer);
};